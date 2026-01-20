package main

func oldFunc(args string) string {
	return args
}

func main() {
	oldFunc("test")
	oldFunc("another")

	func_call("error")
	func_call("success")
}

func swap(a, b int) (int, int) {
	return a, b
}
