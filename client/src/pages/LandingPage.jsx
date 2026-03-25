import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E1F5EE] via-white to-[#EEEDFE] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-6">
      
      <div className="text-center max-w-2xl w-full">

        {/* Logo */}
        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-md flex items-center justify-center text-4xl mx-auto mb-6">
          🎓
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3"
          style={{ fontFamily: "Nunito, sans-serif" }}>
          Study Hub
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Smart learning platform for students, teachers, and parents
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
          <Link to="/login">
            <button className="btn btn-teal btn-lg w-full md:w-48">
              Login →
            </button>
          </Link>

          <Link to="/register">
            <button className="btn btn-outline btn-lg w-full md:w-48">
              Register
            </button>
          </Link>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { role: "Student", icon: "🧑‍🎓" },
            { role: "Teacher", icon: "👩‍🏫" },
            { role: "Parent", icon: "👨‍👩‍👧" },
            { role: "Admin", icon: "🛠️" },
          ].map((r) => (
            <div
              key={r.role}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="text-2xl mb-2">{r.icon}</div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {r.role}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}