package db

type User struct {
	ID           int      `gorm:"AUTO_INCREMENT;primary_key"`
	Email        string   `gorm:"type:varchar(255);unique;not null"`
	FirstName    string   `gorm:"type:varchar(50);not null"`
	LastName     string   `gorm:"type:varchar(50);not null"`
	PasswordHash []byte   `gorm:"type:binary(60);not null"`
	AvatarURL    *string  `gorm:"type:varchar(255)"`
	Plugins      []Plugin `gorm:"many2many:plugin_users"`
}

type Site struct {
	ID   int    `gorm:"AUTO_INCREMENT;primary_key"`
	Name string `gorm:"type:varchar(50);not null"`
	/*CreatorID int
	Creator   User     `gorm:"foreignkey:CreatorID"`*/
	Plugins []Plugin `gorm:"many2many:plugin_sites"`
}

type Plugin struct {
	ID          int    `gorm:"AUTO_INCREMENT;primary_key"`
	Name        string `gorm:"type:varchar(50);not null"`
	Description string `gorm:"type:varchar(255);not null"`
	Sites       []Site `gorm:"many2many:plugin_sites"`
	Users       []User `gorm:"many2many:plugin_users"`
}

/*
type PluginUser struct {
	ID       int    `gorm:"AUTO_INCREMENT;primary_key"`
	PluginID int    `gorm:"unique_index:idx_plugin_user_site"`
	Plugin   Plugin `gorm:"foreignkey:PluginID"`
	UserID   int    `gorm:"unique_index:idx_plugin_user_site"`
	User     User   `gorm:"foreignkey:UserID"`
	SiteID   int    `gorm:"unique_index:idx_plugin_user_site"`
	Site     Site   `gorm:"foreignkey:SiteID"`
}
*/
