export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
      });

      next();
    } catch (error) {
      console.log("Validation Error caught:", error);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors || error.message,
      });
    }
  };
};
