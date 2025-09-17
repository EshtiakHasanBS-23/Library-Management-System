import { Link } from "react-router-dom";

export default function SideNavigation() {
  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <div className="px-4 py-3 border-b font-semibold text-gray-800">
        Navigation
      </div>

      <div className="p-3 text-sm">
        <ul className="space-y-2">
          <li className="text-gray-700">Dashboard</li>
          <li className="text-gray-700">Site home</li>
          <li className="text-gray-700">Site pages</li>

          <li className="text-gray-700 font-medium mt-2">My courses</li>
          <ul className="ml-5 mt-1 space-y-1 text-gray-600">
            <li>
              <Link to="#" className="hover:underline">
                Digital Assets Security and Privacy
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:underline">
                IT Incident Reporting
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:underline">
                Prompt Engineering Foundations
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:underline">
                Remote Work Policy
              </Link>
            </li>
          </ul>
        </ul>
      </div>
    </div>
  );
}
