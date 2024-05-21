import React from "react";

function Footer() {
    return (
        <footer>
            <div className="footerbg-ctn">
                <div className="row footer-ctn">
                    <div className="col col-12 col-sm-12 col-md-6 col-lg-7 col-xl-7 mb-2">
                        <p className="p-footer f-book">Help</p>
                    </div>
                    <div className="col col-12 col-sm-4 col-md-3 col-lg-3 col-xl-2 mb-2">
                        <p className="p-footer f-book">Mobile download on:</p>
                    </div>
                    <div className="col col-12 col-sm-12 col-md-2 col-lg-2 col-xl-3">
                        <img src="Images/iosapp.svg" alt="download ios" className="appDwn" />
                        <img src="Images/androidapp.svg" alt="download android" className="appDwn" />
                    </div>
                </div>
            </div>
        </footer>
    );
}


export default Footer;