import React from "react";
import { Link } from "react-router-dom";

function Navbar(){
    return (
        <nav>   
            <div className="navbar">
                <div className="col">
                    <Link to="/">
                        <img src="Images/logo.png" alt="logo" className="img-logo" />
                    </Link>
                    <Link to="/">
                        <button className="btn-loginHome"><p className="p-loginMainBtn f-bold">Log in</p></button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
