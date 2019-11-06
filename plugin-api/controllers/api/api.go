package api

import (
	"github.com/labstack/echo"
	"github.com/shanepm/plugin-api/controllers/api/v1"
)

func Route(e *echo.Echo) {
	api := e.Group("/api")
	v1.Route(api)
}
