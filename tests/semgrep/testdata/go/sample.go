package main

import "fmt"

func testFunction() {
	fmt.Println("Debug message")
	fmt.Println("Another debug")
}

func dangerousFunction() {
	password := "hardcoded_password"
	query := "SELECT * FROM users WHERE id = " + userInput
	return
}

func apiFunction() {
	http.Get("https://api.example.com")
	http.Post("https://api.example.com/data")
	return
}

func assignmentTest() {
	x := 10
	x = 20
	return
}

func oldFunc(args string) string {
	return args
}

func main() {
	oldFunc("test")
	oldFunc("another")
}
