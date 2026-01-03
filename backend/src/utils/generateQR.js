import QRCode from "qrcode";

export const generateQR = async (data) => {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      width: 300
    });
    return qrCode;
  } catch (error) {
    console.error("QR generation failed", error);
    throw error;
  }
};
