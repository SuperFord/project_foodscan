import { Routes , Route } from "react-router";
import Main from "./Main.js"
// User
import ULogin from "./User/Menu/Login.js";
import Register from "./User/Menu/Register.js";
import ForgetPassword from "./User/Menu/ForgetPassword.js";
import UMenu from "./User/Menu.js";
import Profile from "./User/Menu/Profile.js";
import Setting from "./User/Menu/Setting.js";
import ChangePassword from "./User/Menu/ChangePassword.js";
import Reservation from "./User/Menu/Reservation.js";
import ReserTable from "./User/Menu/ReserTable.js";
import ReserFood from "./User/Menu/ReserFood.js";
import ReserDetail from "./User/Menu/ReserDetail.js";
import ReserEdit from "./User/Menu/ReserEdit.js";
import Detail from "./User/Menu/Detail.js";
import UHistory from "./User/Menu/History.js";
//Restaurant
import RLogin from "./Restaurant/Menu/Login.js";
import RMenu from "./Restaurant/Menu.js";
import TableLayouts from "./Restaurant/Menu/TableLayouts.js";
import TableEditlayouts from "./Restaurant/Menu/TableEditlayouts.js";
import TableMap from "./Restaurant/Menu/TableMap.js";
import TableReservation from "./Restaurant/Menu/TableReservation.js";
import TableStatus from "./Restaurant/Menu/TableStatus.js";
import RHistory from "./Restaurant/Menu/History.js";
import Listfood from "./Restaurant/Menu/Listfood.js";
import Listfoodadd from "./Restaurant/Menu/Listfoodadd.js";
import Listfoodedit from "./Restaurant/Menu/Listfoodedit.js";
import ProtectedRoute from "./Restaurant/components/ProtectedRoute.js";

//repassword ส่งลิ่ง
import RequestReset from "./User/Menu/RequestReset";
import ResetPassword from "./User/Menu/ResetPassword";

// ระบบ qr ต่างๆ
import PaymentQR from './User/Menu/PaymentQR';
import QRSettings from './Restaurant/Menu/QRSettings';

import PaymentSlipManagement from './Restaurant/Menu/payment-slip-management';
function App() {

  return (
    <div className="path"> 
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="Main" element={<Main />} />
        {/* User */}
        <Route path="/User" element={<ULogin />} />
        <Route path="/User/Login" element={<ULogin />} />
        <Route path="/User/Register" element={<Register />} />
        <Route path="/User/ForgetPassword" element={<ForgetPassword />} />
        <Route path="/User/Menu" element={<UMenu />} />
        <Route path="/User/Menu/Profile" element={<Profile />} />
        <Route path="/User/Menu/Setting" element={<Setting />} />          
        <Route path="/User/Menu/ChangePassword" element={<ChangePassword />} />
        <Route path="/User/Menu/ReserTable" element={<ReserTable />} />
        <Route path="/User/Menu/Reservation" element={<Reservation />} />
        <Route path="/User/Menu/ReserFood" element={<ReserFood />} />
        <Route path="/User/Menu/ReserDetail" element={<ReserDetail />} />
        <Route path="/User/Menu/ReserEdit" element={<ReserEdit />} />
        <Route path="/User/Menu/Detail" element={<Detail />} />
        <Route path="/User/Menu/History" element={<UHistory />} />
        {/* Restaurant */}
        <Route path="/Restaurant/" element={<RLogin />} />
        <Route path="/Restaurant/Login" element={<RLogin />} />
        <Route path="/Restaurant/Menu" element={
          <ProtectedRoute>
            <RMenu />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/Listfood" element={
          <ProtectedRoute>
            <Listfood />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/Listfoodadd" element={
          <ProtectedRoute>
            <Listfoodadd />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/Listfoodedit/:id" element={
          <ProtectedRoute>
            <Listfoodedit />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/TableLayouts" element={
          <ProtectedRoute>
            <TableLayouts />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/TableEditlayouts" element={
          <ProtectedRoute>
            <TableEditlayouts />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/TableMap" element={
          <ProtectedRoute>
            <TableMap />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/TableReservation" element={
          <ProtectedRoute>
            <TableReservation />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/TableStatus" element={
          <ProtectedRoute>
            <TableStatus />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/History" element={
          <ProtectedRoute>
            <RHistory />
          </ProtectedRoute>
        } />
        <Route path="/Restaurant/Menu/PaymentSlipManagement" element={
          <ProtectedRoute>
            <PaymentSlipManagement />
          </ProtectedRoute>
        } />
        {/* repassword ส่งลิ่ง */}
        <Route path="/User/RequestReset" element={<RequestReset />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/payment" element={<PaymentQR />} />
        <Route path="/QRSettings" element={<QRSettings />} />

        
      </Routes>
    </div>
  );
}

export default App;