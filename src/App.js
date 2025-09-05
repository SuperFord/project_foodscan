import { Routes , Route } from "react-router";
import Main from "./Main.js"
// User
import ULogin from "./User/Menu/Login.js";
import Register from "./User/Menu/Register.js";
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
        <Route path="/user" element={<ULogin />} />
        <Route path="/user-login" element={<ULogin />} />
        <Route path="/user-register" element={<Register />} />
        <Route path="/user-menu" element={<UMenu />} />
        <Route path="/user-profile" element={<Profile />} />
        <Route path="/user-setting" element={<Setting />} />          
        <Route path="/user-change-password" element={<ChangePassword />} />
        <Route path="/user-reser-table" element={<ReserTable />} />
        <Route path="/user-reservation" element={<Reservation />} />
        <Route path="/user-reser-food" element={<ReserFood />} />
        <Route path="/user-reser-detail" element={<ReserDetail />} />
        <Route path="/user-reser-edit" element={<ReserEdit />} />
        <Route path="/user-detail" element={<Detail />} />
        <Route path="/user-history" element={<UHistory />} />
        {/* Restaurant */}
        <Route path="/restaurant" element={<RLogin />} />
        <Route path="/restaurant-login" element={<RLogin />} />
        <Route path="/restaurant-menu" element={
          <ProtectedRoute>
            <RMenu />
          </ProtectedRoute>
        } />
        <Route path="/listfood" element={
          <ProtectedRoute>
            <Listfood />
          </ProtectedRoute>
        } />
        <Route path="/listfood-add" element={
          <ProtectedRoute>
            <Listfoodadd />
          </ProtectedRoute>
        } />
        <Route path="/listfood-edit/:id" element={
          <ProtectedRoute>
            <Listfoodedit />
          </ProtectedRoute>
        } />
        <Route path="/table-layouts" element={
          <ProtectedRoute>
            <TableLayouts />
          </ProtectedRoute>
        } />
        <Route path="/table-edit-layouts" element={
          <ProtectedRoute>
            <TableEditlayouts />
          </ProtectedRoute>
        } />
        <Route path="/table-map" element={
          <ProtectedRoute>
            <TableMap />
          </ProtectedRoute>
        } />
        <Route path="/table-reservation" element={
          <ProtectedRoute>
            <TableReservation />
          </ProtectedRoute>
        } />
        <Route path="/table-status" element={
          <ProtectedRoute>
            <TableStatus />
          </ProtectedRoute>
        } />
        <Route path="/restaurant-history" element={
          <ProtectedRoute>
            <RHistory />
          </ProtectedRoute>
        } />
        <Route path="/payment-slip-management" element={
          <ProtectedRoute>
            <PaymentSlipManagement />
          </ProtectedRoute>
        } />
        {/* repassword ส่งลิ่ง */}
        <Route path="/user-request-reset" element={<RequestReset />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/payment" element={<PaymentQR />} />
        <Route path="/QRSettings" element={<QRSettings />} />

        
      </Routes>
    </div>
  );
}

export default App;