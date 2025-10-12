import React from "react";
import { Clock, Truck, Flame } from "lucide-react";

export function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Flame className="h-10 w-10 text-red-500" />
            <h1 className="text-4xl font-bold text-white">About FireLink SL</h1>
          </div>
          <p className="text-gray-400 text-lg">
            The proud history and evolution of the Colombo Fire Brigade.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Introduction */}
          <div className="p-8 border-b border-gray-700">
            <h2 className="text-2xl font-semibold text-red-500 mb-4">
              Our Origins
            </h2>
            <p className="text-gray-300 leading-relaxed">
              The Colombo Fire Brigade began in the late 1800s, when simple
              water pots were used to extinguish fires. Officially established
              in 1898, it had its first permanent building by 1900. Firefighting
              equipment included a cart pulled by four men with iron wheels.
            </p>
          </div>

          {/* Timeline */}
          <div className="divide-y divide-gray-700">
            {/* Era 1 */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4 flex flex-col items-center">
                <Clock className="h-12 w-12 text-red-500 mb-2" />
                <span className="font-semibold text-gray-400">1905–1913</span>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-bold text-white">
                  Early Development
                </h3>
                <p className="mt-3 text-gray-300 leading-relaxed">
                  Under Chief Officer L. A. B. Pill, the staff grew from 9 to
                  19. Hand pumps replaced water-drawn tanks, and operations
                  moved to a permanent station near the harbor.
                </p>
              </div>
            </div>

            {/* Era 2 */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4 flex flex-col items-center">
                <Truck className="h-12 w-12 text-red-500 mb-2" />
                <span className="font-semibold text-gray-400">1913–1931</span>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-bold text-white">
                  Mechanization Era
                </h3>
                <p className="mt-3 text-gray-300 leading-relaxed">
                  Chief Officer P. H. Lanway led the shift to mechanized
                  firefighting, introducing engines, pumps, and ambulances.
                  Labor conditions were tough—firemen worked six days straight
                  with just one day off.
                </p>
              </div>
            </div>

            {/* Era 3 */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4 flex flex-col items-center">
                <Clock className="h-12 w-12 text-red-500 mb-2" />
                <span className="font-semibold text-gray-400">1931–1946</span>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-bold text-white">
                  Local Leadership
                </h3>
                <p className="mt-3 text-gray-300 leading-relaxed">
                  Mr. B. E. Weerasinghe became the first Sri Lankan Chief
                  Officer in 1933. The brigade played a vital role during World
                  War II, responding even during air raids on Colombo.
                </p>
              </div>
            </div>

            {/* Era 4 */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4 flex flex-col items-center">
                <Truck className="h-12 w-12 text-red-500 mb-2" />
                <span className="font-semibold text-gray-400">1946–1969</span>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-bold text-white">
                  Modern Developments
                </h3>
                <p className="mt-3 text-gray-300 leading-relaxed">
                  Under Chief Officer C. T. Perera, the brigade expanded and
                  modernized its fleet. Work schedules improved, and new
                  personnel were recruited from across the island.
                </p>
              </div>
            </div>

            {/* Era 5 */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4 flex flex-col items-center">
                <Clock className="h-12 w-12 text-red-500 mb-2" />
                <span className="font-semibold text-gray-400">1969–1977</span>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-bold text-white">
                  Expansion & Modernization
                </h3>
                <p className="mt-3 text-gray-300 leading-relaxed">
                  New headquarters were constructed, and 35 additional firemen
                  joined. The work system evolved to 8-hour shifts, marking a
                  major step toward global standards.
                </p>
              </div>
            </div>

            {/* Era 6 */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4 flex flex-col items-center">
                <Truck className="h-12 w-12 text-red-500 mb-2" />
                <span className="font-semibold text-gray-400">
                  1977–Present
                </span>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-bold text-white">Recent History</h3>
                <p className="mt-3 text-gray-300 leading-relaxed">
                  The Colombo Fire Brigade continues to advance with modern
                  technology, improved facilities, and dedicated professionals
                  committed to public safety.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 p-8 border-t border-gray-700 text-center">
            <p className="italic text-gray-400 text-lg max-w-3xl mx-auto">
              “From humble beginnings to a modern emergency service, the Colombo
              Fire Brigade stands as a symbol of courage, discipline, and
              dedication.”
            </p>
            <p className="mt-4 text-red-500 font-semibold">— FireLink SL —</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;