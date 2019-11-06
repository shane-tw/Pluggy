package v1

import (
	"net/http"
	"strconv"

	"github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	"github.com/shanepm/plugin-api/consts/errors"
	apiModels "github.com/shanepm/plugin-api/models/api"
	v1Models "github.com/shanepm/plugin-api/models/api/v1"
	dbModels "github.com/shanepm/plugin-api/models/db"

	"github.com/labstack/echo"
)

func RouteSites(g *echo.Group) {
	g.POST("/sites", AddSite)
	g.DELETE("/sites/:id", DeleteSite)
}

func AddSite(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	criteria := new(v1Models.Site)
	err := c.Bind(criteria)
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	apiErrors := []apiModels.Error{}
	if len(criteria.Name) == 0 {
		apiErrors = append(apiErrors, errors.MissingSiteName)
	}
	if len(apiErrors) > 0 {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: apiErrors})
	}

	siteToCreate := dbModels.Site{Name: criteria.Name}
	if err := db.Create(&siteToCreate).Error; err != nil {
		if mysqlError, ok := err.(*mysql.MySQLError); ok && mysqlError.Number == 1062 {
			return c.JSON(http.StatusConflict, apiModels.FailedResponse{Errors: []apiModels.Error{errors.UserAlreadyExists}})
		}
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"site": v1Models.Site{
			ID:   siteToCreate.ID,
			Name: siteToCreate.Name,
		},
	})
}

func DeleteSite(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	criteriaID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	res := db.Delete(&dbModels.Site{ID: criteriaID})
	if len(res.GetErrors()) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	} else if res.RowsAffected == 0 {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	return c.NoContent(http.StatusNoContent)
}
