package cache

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewManager(t *testing.T) {
	mgr := NewManager(5*time.Minute, 10*time.Minute)
	assert.NotNil(t, mgr)
}

func TestManager_GetSet(t *testing.T) {
	mgr := NewManager(5*time.Minute, 10*time.Minute)

	// Set a value
	mgr.Set("test-key", "test-value", 5*time.Minute)

	// Get the value
	value, found := mgr.Get("test-key")
	assert.True(t, found)
	assert.Equal(t, "test-value", value)
}

func TestManager_Get_NotFound(t *testing.T) {
	mgr := NewManager(5*time.Minute, 10*time.Minute)

	value, found := mgr.Get("non-existent-key")
	assert.False(t, found)
	assert.Nil(t, value)
}

func TestManager_Delete(t *testing.T) {
	mgr := NewManager(5*time.Minute, 10*time.Minute)

	mgr.Set("test-key", "test-value", 5*time.Minute)
	mgr.Delete("test-key")

	value, found := mgr.Get("test-key")
	assert.False(t, found)
	assert.Nil(t, value)
}

func TestManager_Clear(t *testing.T) {
	mgr := NewManager(5*time.Minute, 10*time.Minute)

	mgr.Set("test-key1", "value1", 5*time.Minute)
	mgr.Set("test-key2", "value2", 5*time.Minute)

	mgr.Clear()

	_, found1 := mgr.Get("test-key1")
	_, found2 := mgr.Get("test-key2")
	assert.False(t, found1)
	assert.False(t, found2)
}

func TestManager_GetStats(t *testing.T) {
	mgr := NewManager(5*time.Minute, 10*time.Minute)

	mgr.Set("test-key1", "value1", 5*time.Minute)
	mgr.Set("test-key2", "value2", 5*time.Minute)

	stats := mgr.GetStats()
	assert.Equal(t, 2, stats.Size)
}

