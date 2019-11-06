package v1

import (
	"net/http"

	"github.com/jinzhu/gorm"
	"github.com/labstack/echo"
	"github.com/labstack/echo-contrib/session"
	"github.com/shanepm/plugin-api/consts/errors"
	apiModels "github.com/shanepm/plugin-api/models/api"
	v1Models "github.com/shanepm/plugin-api/models/api/v1"
	dbModels "github.com/shanepm/plugin-api/models/db"
	"golang.org/x/crypto/bcrypt"
)

func RouteSession(g *echo.Group) {
	g.POST("/session", LogIn)
	g.DELETE("/session", LogOut)
}

func LogIn(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	auth := new(v1Models.Auth)
	err := c.Bind(auth)
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	apiErrors := []apiModels.Error{}
	if len(auth.Email) == 0 {
		apiErrors = append(apiErrors, errors.MissingEmail)
	}
	if len(auth.Password) == 0 {
		apiErrors = append(apiErrors, errors.MissingPassword)
	}
	if len(apiErrors) > 0 {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: apiErrors})
	}

	dbUser := new(dbModels.User)
	res := db.First(&dbUser, dbModels.User{Email: auth.Email})
	if res.RecordNotFound() {
		return c.JSON(http.StatusUnauthorized, apiModels.FailedResponse{Errors: []apiModels.Error{errors.InvalidLogin}})
	} else if len(res.GetErrors()) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	err = bcrypt.CompareHashAndPassword(dbUser.PasswordHash, []byte(auth.Password))
	if err != nil {
		return c.JSON(http.StatusUnauthorized, apiModels.FailedResponse{Errors: []apiModels.Error{errors.InvalidLogin}})
	}

	sess, _ := session.Get("session", c)
	sess.Values["userID"] = dbUser.ID
	sess.Save(c.Request(), c.Response())

	return c.JSON(http.StatusOK, map[string]interface{}{
		"user": v1Models.User{
			ID:        dbUser.ID,
			Email:     dbUser.Email,
			FirstName: dbUser.FirstName,
			LastName:  dbUser.LastName,
			AvatarURL: dbUser.AvatarURL,
		},
	})
}

func LogOut(c echo.Context) error {
	sess, _ := session.Get("session", c)
	delete(sess.Values, "userID")
	sess.Save(c.Request(), c.Response())

	return c.NoContent(http.StatusNoContent)
}
