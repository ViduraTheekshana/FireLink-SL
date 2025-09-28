import axios from "axios";

const BASE_URL = "/api/prevention-officer";

const getApplications = async () => {
  const res = await axios.get(`${BASE_URL}/applications`);
  return res.data;
};

const assignPayment = async (id, payment) => {
  await axios.put(`${BASE_URL}/applications/${id}/payment`, { payment });
};

export default { getApplications, assignPayment };
