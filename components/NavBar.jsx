export default function NavBar(){
    return(
    <>
        <nav className="px-5 h-[10vh] bg-gradient-to-b from-blue-100 via-blue-100 via-50% to-pink-300 text-blue-950 w-full fixed top-0 flex justify-evenly font-medium z-30">
            <ul className="inline-flex items-center justify-center space-x-5">
                <li><a href="/">Link</a></li>
                <li><a href="/">Link</a></li>
                <li><a href="/">Link</a></li>
                <li><a href="/">Link</a></li>
            </ul>
            <div className="inline-flex items-center justify-center">
                <h2 className="text-2xl font-bold">ALIBOBO</h2>
            </div>
            <ul className="inline-flex items-center justify-center space-x-5">
                <li><a href="/">Link</a></li>
                <li><a href="/">Link</a></li>
                <li><a href="/">Link</a></li>
                <li><a href="/account">Account</a></li>
            </ul>
        </nav>
    </>
    );
}