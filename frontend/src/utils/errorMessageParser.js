const extractErrorMessage = (error) => {
	if (
		error.response?.data?.errors &&
		Array.isArray(error.response.data.errors)
	) {
		return error.response.data.errors.join(" & ");
	}

	if (error.response?.data?.message) {
		return error.response.data.message;
	}

	if (error.message) {
		return error.message;
	}

	return "An unexpected error occurred. Please try again.";
};

export default extractErrorMessage;
