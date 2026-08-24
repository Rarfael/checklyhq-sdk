package core

type ChecklyhqError struct {
	IsChecklyhqError bool
	Sdk              string
	Code             string
	Msg              string
	Ctx              *Context
	Result           any
	Spec             any
}

func NewChecklyhqError(code string, msg string, ctx *Context) *ChecklyhqError {
	return &ChecklyhqError{
		IsChecklyhqError: true,
		Sdk:              "Checklyhq",
		Code:             code,
		Msg:              msg,
		Ctx:              ctx,
	}
}

func (e *ChecklyhqError) Error() string {
	return e.Msg
}
