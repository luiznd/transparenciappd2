package config

import (
	"os"
	"strings"
)

type DataSource string

const (
	DataSourceMock    DataSource = "mock"
	DataSourceMongoDB DataSource = "mongodb"
	DataSourceGCS     DataSource = "gcs"
)

type Config struct {
	DataSource DataSource
	
	// MongoDB config
	MongoURI string
	
	// GCS config
	GCSBucketName string
	GCSFileName   string
	GCSCredentials string // Path to service account JSON file
}

func LoadConfig() *Config {
	config := &Config{
		DataSource: DataSourceMongoDB, // Default
		MongoURI:   os.Getenv("MONGO_URI"),
		GCSBucketName: os.Getenv("GCS_BUCKET_NAME"),
		GCSFileName:   os.Getenv("GCS_FILE_NAME"),
		GCSCredentials: os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"),
	}
	
	// Determine data source based on environment variable
	dataSourceEnv := strings.ToLower(os.Getenv("DATA_SOURCE"))
	switch dataSourceEnv {
	case "mock":
		config.DataSource = DataSourceMock
	case "gcs":
		config.DataSource = DataSourceGCS
	case "mongodb":
		config.DataSource = DataSourceMongoDB
	default:
		// Keep default (MongoDB)
	}
	
	return config
}

func (c *Config) IsMock() bool {
	return c.DataSource == DataSourceMock
}

func (c *Config) IsGCS() bool {
	return c.DataSource == DataSourceGCS
}

func (c *Config) IsMongoDB() bool {
	return c.DataSource == DataSourceMongoDB
}