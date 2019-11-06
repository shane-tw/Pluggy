package v1

import (
	"math"
	"net/http"
	"strconv"

	"github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	"github.com/shanepm/plugin-api/consts/errors"
	apiModels "github.com/shanepm/plugin-api/models/api"
	v1Models "github.com/shanepm/plugin-api/models/api/v1"
	dbModels "github.com/shanepm/plugin-api/models/db"
	"golang.org/x/crypto/bcrypt"

	"github.com/labstack/echo"
	"github.com/labstack/echo-contrib/session"
)

func RouteUsers(g *echo.Group) {
	g.GET("/users", GetUsers)
	g.GET("/users/:id", GetUsers)
	g.PUT("/users/:id", EditUser)
	g.DELETE("/users/:id", DeleteUser)
}

func GetUserIDFromParam(c echo.Context, key string) int {
	userID := 0
	if c.Param(key) == "me" {
		sess, _ := session.Get("session", c)
		userID = sess.Values["userID"].(int)
	} else if len(c.Param(key)) > 0 {
		if criteriaID, err := strconv.Atoi(c.Param(key)); err == nil {
			userID = criteriaID
		}
	}
	return userID
}

func GetUsers(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)
	// siteID := c.Param("siteID")

	criteria := new(v1Models.User)
	err := c.Bind(criteria)
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	if len(c.Param("id")) > 0 {
		criteria.ID = GetUserIDFromParam(c, "id")
		if criteria.ID == 0 {
			return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
		}
	}

	defaultPage := 1
	if criteria.Page == nil {
		criteria.Page = &defaultPage
	}

	defaultPageSize := 50
	if criteria.PageSize == nil {
		criteria.PageSize = &defaultPageSize
	}
	*criteria.PageSize = int(math.Min(math.Max(0, float64(*criteria.PageSize)), 100))

	criteriaUser := dbModels.User{ID: criteria.ID, Email: criteria.Email, FirstName: criteria.FirstName, LastName: criteria.LastName}
	pageOffset := (*criteria.Page - 1) * *criteria.PageSize

	usersCount := 0
	errs := db.Model(&dbModels.User{}).Where(&criteriaUser).Count(&usersCount).GetErrors()
	if len(errs) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	dbUsers := []dbModels.User{}
	errs = db.Where(&criteriaUser).Limit(*criteria.PageSize).Offset(pageOffset).Find(&dbUsers).GetErrors()
	if len(errs) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	users := []v1Models.User{}
	for _, dbUser := range dbUsers {
		users = append(users, v1Models.User{
			ID:        dbUser.ID,
			Email:     dbUser.Email,
			FirstName: dbUser.FirstName,
			LastName:  dbUser.LastName,
			AvatarURL: dbUser.AvatarURL,
		})
	}

	jsonData := map[string]interface{}{}
	if len(c.Param("id")) > 0 {
		if len(users) == 0 {
			return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
		}
		jsonData["user"] = users[0]
	} else {
		jsonData["users"] = users
		c.Response().Header().Add("X-Records", strconv.Itoa(usersCount))
		c.Response().Header().Add("X-Page", strconv.Itoa(*criteria.Page))
		c.Response().Header().Add("X-Pages", strconv.Itoa(int(math.Ceil(float64(usersCount)/float64(*criteria.PageSize)))))
	}

	return c.JSON(http.StatusOK, jsonData)
}

func AddUser(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	criteria := new(v1Models.User)
	err := c.Bind(criteria)
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	apiErrors := []apiModels.Error{}
	if len(criteria.Email) == 0 {
		apiErrors = append(apiErrors, errors.MissingEmail)
	}
	if len(criteria.Password) == 0 {
		apiErrors = append(apiErrors, errors.MissingPassword)
	}
	if len(criteria.FirstName) == 0 {
		apiErrors = append(apiErrors, errors.MissingFirstName)
	}
	if len(criteria.LastName) == 0 {
		apiErrors = append(apiErrors, errors.MissingLastName)
	}
	if len(apiErrors) > 0 {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: apiErrors})
	}

	pwd, _ := bcrypt.GenerateFromPassword([]byte(criteria.Password), 14)
	userToCreate := dbModels.User{Email: criteria.Email, FirstName: criteria.FirstName, LastName: criteria.LastName, PasswordHash: pwd}
	if err := db.Create(&userToCreate).Error; err != nil {
		if mysqlError, ok := err.(*mysql.MySQLError); ok && mysqlError.Number == 1062 {
			return c.JSON(http.StatusConflict, apiModels.FailedResponse{Errors: []apiModels.Error{errors.UserAlreadyExists}})
		}
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	sess, _ := session.Get("session", c)
	if sess.Values["userID"] == nil {
		sess.Values["userID"] = userToCreate.ID
		sess.Save(c.Request(), c.Response())
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"user": v1Models.User{
			ID:        userToCreate.ID,
			Email:     userToCreate.Email,
			FirstName: userToCreate.FirstName,
			LastName:  userToCreate.LastName,
			AvatarURL: userToCreate.AvatarURL,
		},
	})
}

func EditUser(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	criteria := new(v1Models.User)
	err := c.Bind(criteria)
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	criteria.ID = GetUserIDFromParam(c, "id")
	if criteria.ID == 0 {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	userDetails := new(dbModels.User)
	res := db.First(&userDetails, dbModels.User{ID: criteria.ID})
	if res.RecordNotFound() {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	} else if len(res.GetErrors()) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	changes := dbModels.User{ID: criteria.ID, Email: criteria.Email, FirstName: criteria.FirstName, LastName: criteria.LastName}
	if criteria.PasswordNew != "" {
		apiErrors := []apiModels.Error{}
		if criteria.Password == "" {
			apiErrors = append(apiErrors, errors.MissingPasswordCurrent)
		}
		if criteria.PasswordConfirm == "" {
			apiErrors = append(apiErrors, errors.MissingPasswordConfirm)
		}
		if len(apiErrors) > 0 {
			return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: apiErrors})
		}
		if criteria.PasswordNew != criteria.PasswordConfirm {
			apiErrors = append(apiErrors, errors.InvalidPasswordConfirm)
			return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: apiErrors})
		}

		pwHashNew, _ := bcrypt.GenerateFromPassword([]byte(criteria.PasswordNew), 14)
		err = bcrypt.CompareHashAndPassword(userDetails.PasswordHash, []byte(criteria.Password))
		if err != nil {
			return c.JSON(http.StatusUnauthorized, apiModels.FailedResponse{Errors: []apiModels.Error{errors.InvalidLogin}})
		}
		changes.PasswordHash = pwHashNew
	}

	errs := db.Model(&userDetails).Updates(&changes).GetErrors()
	if len(errs) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"user": v1Models.User{
			ID:        userDetails.ID,
			Email:     userDetails.Email,
			FirstName: userDetails.FirstName,
			LastName:  userDetails.LastName,
			AvatarURL: userDetails.AvatarURL,
		},
	})
}

func DeleteUser(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	criteriaID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	res := db.Delete(&dbModels.User{ID: criteriaID})
	if len(res.GetErrors()) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	} else if res.RowsAffected == 0 {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	return c.NoContent(http.StatusNoContent)
}
