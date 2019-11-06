package v1

import (
	"fmt"
	"io/ioutil"
	"math"
	"mime"
	"net/http"
	"os"
	"strconv"

	"github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	"github.com/shanepm/plugin-api/consts/errors"
	apiModels "github.com/shanepm/plugin-api/models/api"
	v1Models "github.com/shanepm/plugin-api/models/api/v1"
	dbModels "github.com/shanepm/plugin-api/models/db"

	"github.com/labstack/echo"
	"github.com/labstack/echo-contrib/session"
	"github.com/mholt/archiver"
	"github.com/vincent-petithory/dataurl"
)

func RoutePlugins(g *echo.Group) {
	g.GET("/plugins", GetPlugins)
	g.GET("/plugins/:id", GetPlugins)
	g.POST("/plugins", AddPlugin)
	// g.PUT("/plugins/:id", EditPlugin)
	g.DELETE("/plugins/:id", DeletePlugin)
	g.GET("/users/:userId/plugins", GetPlugins)
	g.POST("/users/:userId/plugins", EnablePlugin)
	g.DELETE("/users/:userId/plugins/:pluginId", DisablePlugin)
}

func GetPlugins(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)
	siteID, err := strconv.Atoi(c.Param("siteID"))

	sess, _ := session.Get("session", c)
	currUserID := sess.Values["userID"].(int)

	criteria := new(v1Models.Plugin)
	if err == nil {
		err = c.Bind(criteria)
	}
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	userID := 0
	if len(c.Param("userId")) > 0 {
		userID = GetUserIDFromParam(c, "userId")
		if userID == 0 {
			return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
		}
	}

	if len(c.Param("id")) > 0 {
		if criteriaID, err := strconv.Atoi(c.Param("id")); err == nil {
			criteria.ID = criteriaID
		} else {
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
	pageOffset := (*criteria.Page - 1) * *criteria.PageSize

	pluginsCount := 0
	query := db.Table("plugins").Joins("JOIN plugin_sites ON plugins.id = plugin_sites.plugin_id AND plugin_sites.site_id = ?", siteID)
	if userID > 0 {
		query = query.Joins("JOIN plugin_users ON plugins.id = plugin_users.plugin_id AND plugin_users.user_id = ?", userID)
	}
	if errs := query.Count(&pluginsCount).GetErrors(); len(errs) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	dbPlugins := []dbModels.Plugin{}
	errs := query.Limit(*criteria.PageSize).Offset(pageOffset).Preload("Sites", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, plugin_id")
	}).Find(&dbPlugins).GetErrors()
	if len(errs) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	plugins := []v1Models.Plugin{}
	for _, dbPlugin := range dbPlugins {
		query = db.Table("plugin_users").Where("plugin_id = ? and user_id = ?", dbPlugin.ID, currUserID)
		cnt := 0
		if errs := query.Count(&cnt).GetErrors(); len(errs) > 0 {
			return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
		}
		siteIDs := []int{}
		for _, dbSite := range dbPlugin.Sites {
			siteIDs = append(siteIDs, dbSite.ID)
		}
		plugins = append(plugins, v1Models.Plugin{
			ID:          dbPlugin.ID,
			Name:        dbPlugin.Name,
			Description: dbPlugin.Description,
			Enabled:     cnt > 0,
			SiteIDs:     siteIDs,
		})
	}

	jsonData := map[string]interface{}{}
	if len(c.Param("id")) > 0 {
		if len(plugins) == 0 {
			return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
		}
		jsonData["plugin"] = plugins[0]
	} else {
		jsonData["plugins"] = plugins
		c.Response().Header().Add("X-Records", strconv.Itoa(pluginsCount))
		if *criteria.PageSize > 0 {
			c.Response().Header().Add("X-Page", strconv.Itoa(*criteria.Page))
			c.Response().Header().Add("X-Pages", strconv.Itoa(int(math.Ceil(float64(pluginsCount)/float64(*criteria.PageSize)))))
		}
	}

	return c.JSON(http.StatusOK, jsonData)
}

func AddPlugin(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)
	siteID, err := strconv.Atoi(c.Param("siteID"))

	criteria := new(v1Models.Plugin)
	if err == nil {
		err = c.Bind(criteria)
	}
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	apiErrors := []apiModels.Error{}
	if len(criteria.Name) == 0 {
		apiErrors = append(apiErrors, errors.MissingPluginName)
	}
	if len(criteria.Description) == 0 {
		apiErrors = append(apiErrors, errors.MissingDescription)
	}
	if len(criteria.File) == 0 {
		apiErrors = append(apiErrors, errors.MissingFile)
	}
	if len(apiErrors) > 0 {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: apiErrors})
	}

	siteIDs := []int{siteID}
	dbSites := []dbModels.Site{}
	for _, sid := range siteIDs {
		dbSites = append(dbSites, dbModels.Site{ID: sid})
	}

	dataURL, err := dataurl.DecodeString(criteria.File)
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	tmpDir := ""
	if exts, err := mime.ExtensionsByType(dataURL.ContentType()); exts != nil && err == nil {
		tmpFile, _ := ioutil.TempFile("plugins/tmp", fmt.Sprintf("*%s", exts[0]))
		defer os.Remove(tmpFile.Name())
		if _, err := tmpFile.Write(dataURL.Data); err != nil {
			tmpFile.Close()
			return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.NotAnArchive}})
		}
		if err := tmpFile.Close(); err != nil {
			return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.NotAnArchive}})
		}
		tmpDir, _ = ioutil.TempDir("plugins/tmp", "")
		err = archiver.Unarchive(tmpFile.Name(), tmpDir)
		if err != nil {
			os.Remove(tmpDir)
			return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.NotAnArchive}})
		}
	}

	pluginToCreate := dbModels.Plugin{Name: criteria.Name, Description: criteria.Description, Sites: dbSites}
	if err := db.Create(&pluginToCreate).Error; err != nil {
		if mysqlError, ok := err.(*mysql.MySQLError); ok && mysqlError.Number == 1062 {
			os.Remove(tmpDir)
			return c.JSON(http.StatusConflict, apiModels.FailedResponse{Errors: []apiModels.Error{errors.UserAlreadyExists}})
		}
		os.Remove(tmpDir)
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}

	if err := os.Rename(tmpDir, fmt.Sprintf("plugins/%d", pluginToCreate.ID)); err != nil {
		fmt.Println(err.Error())
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"plugin": v1Models.Plugin{
			ID:          pluginToCreate.ID,
			Name:        pluginToCreate.Name,
			Description: pluginToCreate.Description,
			SiteIDs:     siteIDs,
		},
	})
}

func DeletePlugin(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	criteriaID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	res := db.Delete(&dbModels.Plugin{ID: criteriaID})
	if len(res.GetErrors()) > 0 {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	} else if res.RowsAffected == 0 {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}
	os.Remove(fmt.Sprintf("plugins/%d", criteriaID))

	return c.NoContent(http.StatusNoContent)
}

func EnablePlugin(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	criteria := new(v1Models.Plugin)
	err := c.Bind(criteria)
	if err != nil {
		return c.JSON(http.StatusBadRequest, apiModels.FailedResponse{Errors: []apiModels.Error{errors.BadRequest}})
	}

	userID := GetUserIDFromParam(c, "userId")
	if userID == 0 {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	if err := db.Model(&dbModels.Plugin{ID: criteria.ID}).Association("Users").Append(dbModels.User{ID: userID}).Error; err != nil {
		fmt.Println(err.Error())
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{})
}

func DisablePlugin(c echo.Context) error {
	db := c.Get("db").(*gorm.DB)

	criteriaID, err := strconv.Atoi(c.Param("pluginId"))
	if err != nil {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	userID := GetUserIDFromParam(c, "userId")
	if userID == 0 {
		return c.JSON(http.StatusNotFound, apiModels.FailedResponse{Errors: []apiModels.Error{errors.ItemNotFound}})
	}

	if err := db.Model(&dbModels.Plugin{ID: criteriaID}).Association("Users").Delete(dbModels.User{ID: userID}).Error; err != nil {
		return c.JSON(http.StatusServiceUnavailable, apiModels.FailedResponse{Errors: []apiModels.Error{errors.DatabaseFailure}})
	}
	return c.NoContent(http.StatusNoContent)
}
