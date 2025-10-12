import React from 'react';

const VisionMissionValuesSection = () => (
  <section className="w-full bg-white py-20 flex flex-col items-center">
    {/* Vision */}
  <h2 className="text-5xl font-extrabold text-gray-900 mb-10" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Vision</h2>
  <p className="text-xl font-semibold text-gray-800 mb-20 text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      To be the Excellent Fire Safety Services Provider in Sri Lanka Ensuring Safety of Colombo City, Citizen of Colombo and Visitors.
    </p>

    {/* Mission */}
  <h2 className="text-5xl font-extrabold text-gray-900 mb-10" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Mission</h2>
  <p className="text-xl font-semibold text-gray-800 mb-20 text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      Ensure Fire Safety Services, Effective & Efficient Fire & Rescue Operation, Inspection,<br />
      Consulting & Training and Humanitarian Services Through Well Disciplined<br />
      Trained and Motivated Staff.
    </p>

    {/* Values */}
  <h2 className="text-5xl font-extrabold text-gray-900 mb-10" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Our Values</h2>
  <div className="text-xl font-semibold text-gray-800 text-center space-y-2 mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div>Respect to the Public & Service Requesters</div>
      <div>Team Work</div>
      <div>Training & CPD</div>
      <div>Health & Safety</div>
    </div>
  </section>
);

export default VisionMissionValuesSection;
