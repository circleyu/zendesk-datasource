package plugin

// Config represents the datasource configuration
type Config struct {
	Subdomain string `json:"subdomain"`
	Email     string `json:"email"`
}

// SecureConfig represents secure configuration (API token)
type SecureConfig struct {
	APIToken string `json:"apiToken"`
}

