import { Sprout, Users, Award, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Farmers", value: "500+" },
  { label: "Products Listed", value: "2,000+" },
  { label: "Happy Customers", value: "10,000+" },
  { label: "Cities Served", value: "50+" },
];

const team = [
  { name: "Jane Mwangi", role: "CEO & Co-Founder", avatar: "JM" },
  { name: "Kofi Asante", role: "Head of Farmer Relations", avatar: "KA" },
  { name: "Priya Sharma", role: "Lead Engineer", avatar: "PS" },
  { name: "Carlos Rivera", role: "Operations Manager", avatar: "CR" },
];

export default function About() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sprout className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About AgriLink Market</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            We are on a mission to empower farmers and give customers direct access to the freshest
            produce — building a sustainable food ecosystem for everyone.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container-custom py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ label, value }) => (
            <div key={label} className="card p-6 text-center">
              <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-14">
        <div className="container-custom grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">Our Mission</span>
            </div>
            <h2 className="section-heading mb-4">Farm to Table, Without the Middleman</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              AgriLink was born from a simple idea: what if farmers could sell directly to consumers,
              cutting out expensive intermediaries and ensuring fair prices for everyone?
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Today we connect hundreds of verified farmers with thousands of customers,
              building trust through transparency, quality, and community.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Leaf, label: "Fresh & Organic", desc: "Sourced directly from farms" },
              { icon: Users, label: "Community First", desc: "Supporting local farmers" },
              { icon: Award, label: "Quality Assured", desc: "Every product vetted" },
              { icon: Sprout, label: "Sustainable", desc: "Eco-friendly practices" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card p-4">
                <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-custom py-14">
        <div className="text-center mb-10">
          <h2 className="section-heading">Meet the Team</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Passionate people building a better food system.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map(({ name, role, avatar }) => (
            <div key={name} className="card p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xl mx-auto mb-3">
                {avatar}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-14 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Experience Farm-Fresh Goodness?</h2>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3 font-semibold rounded-lg">Shop Now</Link>
          <Link to="/register" className="btn border-2 border-white text-white hover:bg-white/10 px-6 py-3 font-semibold rounded-lg">Join Us</Link>
        </div>
      </section>
    </div>
  );
}
