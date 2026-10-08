import { CallIcon, EmailIcon, MapIcon } from "@/assets/icons";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/assets/icons/social";
import Link from "next/link";
import AccountLinks from "./AccountLinks";
import FooterBottom from "./FooterBottom";
import { AppStoreIcon, GooglePlayIcon } from "./icons";
import QuickLinks from "./QuickLinks";

const Footer = () => {
  return (
    <footer className="overflow-hidden border-t border-gray-3">
      
      <div className="px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        {/* <!-- footer menu start --> */}
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-5">
       
        </div>
        {/* <!-- footer menu end --> */}
      </div>

      <div className="flex flex-wrap lg:flex-nowrap gap-2 xl:gap-5 md:justify-between px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        {/* <!-- footer menu start --> */}
          <div className="w-full lg:pt-5 footer-columns">
            <AccountLinks />            
            <QuickLinks />
          </div>

            <div className="sm:w-auto lg:pt-5 pb-10">
              <div className="footer-support pt-2">
                <h2 className="text-base font-semibold text-dark">Help & Support</h2>
              
            <ul className="flex flex-col gap-3 pt-2">
               <li>
                <Link href="mailto:orders@diagnostore.com" className="flex gap-4.5 text-base">
                  <EmailIcon className="fill-blue" width={24} height={24} />
                  support@diagnostore.com
                </Link>
              </li>
            </ul>
            </div>
           </div>

















        {/* <!-- footer menu end --> */}
      </div>



      <FooterBottom />
    </footer>
  );
};

export default Footer;
