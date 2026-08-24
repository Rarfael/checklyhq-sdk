package core

var UtilityRegistrar func(u *Utility)

var NewBaseFeatureFunc func() Feature

var NewTestFeatureFunc func() Feature

var NewCheckEntityFunc func(client *ChecklyhqSDK, entopts map[string]any) ChecklyhqEntity

