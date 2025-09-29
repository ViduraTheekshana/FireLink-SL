import React, { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import axios from "axios";

const QRCodeGenerator = ({ sessionId }) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/sessions/generate/${sessionId}`)
      .then((res) => setToken(res.data.token))
      .catch((err) => console.error(err));
  }, [sessionId]);

  if (!token) return <p>Loading QR...</p>;

  return (
    <div className="flex flex-col items-center">
      <QRCode value={token} size={200} />
      <p className="mt-2 text-gray-700 text-sm">
        Scan to mark attendance (valid 5 minutes)
      </p>
    </div>
  );
};

export default QRCodeGenerator;
