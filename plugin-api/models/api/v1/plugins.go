package v1

type Plugin struct {
	Page     *int `json:"page,omitempty"`
	PageSize *int `json:"pageSize,omitempty"`

	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	File        string `json:"file,omitempty"`
	SiteIDs     []int  `json:"siteIds"`
	Enabled     bool   `json:"enabled"`
}
