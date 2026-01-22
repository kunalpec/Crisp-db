const AsyncHandler = (func) => {
  return (req, res, next) => {
    // yahan koi return nahi karna hai
    Promise.resolve(func(req, res, next)).catch((err) => next(err));
  };
};

export default AsyncHandler;
