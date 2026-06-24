import React from "react";

interface FloristCardProps {
  name: string;
  location: string;
  distance: string;
  avatar: string;
  avatarAlt: string;
}

export default function FloristCard({
  name,
  location,
  distance,
  avatar,
  avatarAlt,
}: FloristCardProps) {
  return (
    <div className="min-w-[320px] bg-white rounded-xl p-6 shadow-soft hover:shadow-float transition-all border border-outline-variant/10">
      {/* Florist Info */}
      <div className="flex items-center gap-4 mb-4">
        <img
          className="w-16 h-16 rounded-full object-cover border-2 border-primary-container"
          alt={avatarAlt}
          src={avatar}
        />
        <div>
          <h4 className="font-label-md text-on-surface">{name}</h4>
          <p className="text-[12px] text-outline">
            {location} • {distance} away
          </p>
        </div>
      </div>

      <button className="w-full py-2 border border-secondary text-secondary font-label-md rounded-lg hover:bg-secondary/5 transition-colors">
        Visit Shop
      </button>
    </div>
  );
}
