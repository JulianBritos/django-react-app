import React from "react";
import LoginForm from "../components/LoginForm";
import { Toaster } from "react-hot-toast";

const LoginPage = () => {
  return (
    <div>
      <Toaster position="bottom-center" />
      <LoginForm />
    </div>
  );
};

export default LoginPage;
