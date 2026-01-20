fn main() {
    let x = Some(42);
    let y = Ok("test");
    
    dbg!(x);
    dbg!(y);
    
    println!("debug");
    println!("more debug");
    
    obj.old_field = 10;
    another.old_field = 20;
    
    let result = value.unwrap();
    let another = other.unwrap();
}

fn oldFunc(args: &str) -> &str {
    args
}
