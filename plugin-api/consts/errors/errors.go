package errors

import apiModels "github.com/shanepm/plugin-api/models/api"

var (
	// General errors, starting at 1
	BadRequest      = apiModels.Error{Reason: "Couldn't understand request", Code: 1}
	DatabaseFailure = apiModels.Error{Reason: "Failed to connect to database", Code: 2}
	ItemNotFound    = apiModels.Error{Reason: "The requested item could not be found", Code: 3}
	NotLoggedIn     = apiModels.Error{Reason: "Not logged in", Code: 4}

	// Validation errors, starting at 50
	MissingEmail           = apiModels.Error{Reason: "You need to supply an email address", Code: 50}
	MissingPassword        = apiModels.Error{Reason: "You need to supply a password", Code: 51}
	MissingFirstName       = apiModels.Error{Reason: "You need to supply a first name", Code: 52}
	MissingLastName        = apiModels.Error{Reason: "You need to supply a last name", Code: 53}
	MissingPasswordCurrent = apiModels.Error{Reason: "You need to supply the current password", Code: 54}
	MissingPasswordConfirm = apiModels.Error{Reason: "You need to supply the confirmation password", Code: 55}
	MissingLetter          = apiModels.Error{Reason: "You need to supply a letter", Code: 56}
	MissingAPIKey          = apiModels.Error{Reason: "You need to supply an api key", Code: 57}
	MissingToken           = apiModels.Error{Reason: "You need to supply an oauth token", Code: 58}
	MissingAuthURL         = apiModels.Error{Reason: "You need to supply an oauth url", Code: 59}
	MissingPluginName      = apiModels.Error{Reason: "You need to supply a plugin name", Code: 60}
	MissingDescription     = apiModels.Error{Reason: "You need to supply a description", Code: 61}
	MissingFile            = apiModels.Error{Reason: "You need to supply a file", Code: 62}
	MissingSiteName        = apiModels.Error{Reason: "You need to supply a site name", Code: 63}
	NotAnArchive           = apiModels.Error{Reason: "The file must be an archive", Code: 64}

	// Other errors, starting at 100
	InvalidLogin           = apiModels.Error{Reason: "Wrong login details provided", Code: 100}
	InvalidPasswordConfirm = apiModels.Error{Reason: "Wrong confirmation password", Code: 101}
	UserAlreadyExists      = apiModels.Error{Reason: "A user already exists with the supplied email", Code: 102}
	InvalidLetter          = apiModels.Error{Reason: "Letter must not exceed a single character", Code: 103}
	LetterAlreadyGuessed   = apiModels.Error{Reason: "You've guessed this letter already", Code: 104}
	LostAlready            = apiModels.Error{Reason: "You've lost already", Code: 105}
	PluginAlreadyExists    = apiModels.Error{Reason: "You already have a plugin in progress", Code: 106}
)
