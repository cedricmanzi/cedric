import React from 'react';

const Bill = ({ billData, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Payment Bill</h3>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Print
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
              >
                Close
              </button>
            </div>
          </div>

          <div className="bill-content">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">SmartPark</h1>
              <p className="text-gray-600">Car Wash Management System</p>
              <p className="text-gray-600">Rubavu District, Western Province, Rwanda</p>
            </div>

            {/* Bill Details */}
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bill Information</h4>
                  <p><span className="font-medium">Payment #:</span> {billData.PaymentNumber}</p>
                  <p><span className="font-medium">Service Record #:</span> {billData.RecordNumber}</p>
                  <p><span className="font-medium">Payment Date:</span> {formatDate(billData.PaymentDate)}</p>
                  <p><span className="font-medium">Service Date:</span> {formatDate(billData.ServiceDate)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                  <p><span className="font-medium">Driver Name:</span> {billData.DriverName}</p>
                  <p><span className="font-medium">Phone Number:</span> {billData.PhoneNumber}</p>
                  <p><span className="font-medium">Plate Number:</span> {billData.PlateNumber}</p>
                  <p><span className="font-medium">Car Type:</span> {billData.CarType}</p>
                  <p><span className="font-medium">Car Size:</span> {billData.CarSize}</p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Package:</span>
                  <span>{billData.PackageName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Description:</span>
                  <span>{billData.PackageDescription}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Package Price:</span>
                  <span>{Number(billData.PackagePrice).toLocaleString()} RWF</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Amount Paid:</span>
                    <span className="text-green-600">{Number(billData.AmountPaid).toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 border-t pt-4">
              <p>Thank you for choosing SmartPark!</p>
              <p>For any inquiries, please contact us.</p>
              <p className="mt-2">Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .fixed {
            position: static !important;
          }
          .bg-gray-600 {
            background: transparent !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #000 !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Bill;
