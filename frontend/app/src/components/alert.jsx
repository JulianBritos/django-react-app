import React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { closeAlert } from "../reducer/Actions";

const Alert = (props) => {
  const [classAlert, setClassAlert] = useState("alert");
  const handleClose = () => {
    setClassAlert("alert d-none");
    props.closeAlert();
  };
  return (
    <div className={classAlert}>
      <div className="d-flex">
        <div className="toast-body">{props.message}</div>
        <button onClick={handleClose}>X</button>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  message: state.AuthReducer.message, // Asegúrate de que "auth" es el nombre correcto del reducer
});

export default connect(mapStateToProps, { closeAlert })(Alert);
