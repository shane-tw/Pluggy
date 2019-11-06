package v1

import (
	"github.com/labstack/echo"
	"github.com/shanepm/plugin-api/middleware/requirelogin"
)

func Route(g *echo.Group) {
	api := g.Group("/v1/sites/:siteID")
	RouteSession(api)
	api.POST("/users", AddUser)
	RouteSites(api)

	lgn := api.Group("")
	lgn.Use(requirelogin.ApiHandler)
	RouteUsers(lgn)
	RoutePlugins(lgn)
}
