package api

type FailedResponse struct {
	Message string  `json:"message,omitempty"`
	Errors  []Error `json:"errors,omitempty"`
}

type Error struct {
	Reason string `json:"reason"`
	Code   int    `json:"code"`
}
