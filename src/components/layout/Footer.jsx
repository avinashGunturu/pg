import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              Home
            </Link>
            <Link to="/about" className="text-gray-400 hover:text-gray-500">
              About
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-gray-500">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-gray-500">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-gray-500">
              Contact
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-400">
              &copy; {currentYear} PG Manager. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;