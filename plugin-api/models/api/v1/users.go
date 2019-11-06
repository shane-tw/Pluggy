package v1

type User struct {
	Page     *int `json:"page,omitempty"`
	PageSize *int `json:"pageSize,omitempty"`

	ID              int     `json:"id"`
	Email           string  `json:"email"`
	Password        string  `json:"password,omitempty"`        // current password
	PasswordNew     string  `json:"passwordNew,omitempty"`     // new password
	PasswordConfirm string  `json:"passwordConfirm,omitempty"` // new password, confirm
	FirstName       string  `json:"firstName"`
	LastName        string  `json:"lastName"`
	AvatarURL       *string `json:"avatarURL"`
}
