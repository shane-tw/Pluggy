package requirelogin

import (
	"net/http"

	"github.com/labstack/echo"
	"github.com/labstack/echo-contrib/session"
	"github.com/shanepm/plugin-api/consts/errors"
	apiModels "github.com/shanepm/plugin-api/models/api"
)

func ApiHandler(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sess, _ := session.Get("session", c)
		/*if sess.IsNew && len(c.Param("siteID")) > 0 {
			sess.Options.Path = "/api/v1/sites/" + c.Param("siteID")
			sess.Save(c.Request(), c.Response())
		}*/
		if sess.Values["userID"] == nil {
			return c.JSON(http.StatusUnauthorized, apiModels.FailedResponse{Errors: []apiModels.Error{errors.NotLoggedIn}})
		}
		return next(c)
	}
}
