package v1

type Site struct {
	Page     *int `json:"page,omitempty"`
	PageSize *int `json:"pageSize,omitempty"`

	ID   int    `json:"id"`
	Name string `json:"name"`
}
