const SparePart = require("../models/SparePart");
const StockIn = require("../models/StockIn");
const StockOut = require("../models/StockOut");

const dayRange = (dateStr) => {
  const d = new Date(String(dateStr));
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const dailyStockStatus = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date query (YYYY-MM-DD) is required" });
    }
    const range = dayRange(date);
    if (!range) {
      return res.status(400).json({ message: "Invalid date" });
    }
    const parts = await SparePart.find();
    const rows = [];
    for (const p of parts) {
      const inSum = await StockIn.aggregate([
        {
          $match: {
            sparePart: p._id,
            stockInDate: { $gte: range.start, $lt: range.end },
          },
        },
        { $group: { _id: null, total: { $sum: "$stockInQuantity" } } },
      ]);
      const outSum = await StockOut.aggregate([
        {
          $match: {
            sparePart: p._id,
            stockOutDate: { $gte: range.start, $lt: range.end },
          },
        },
        { $group: { _id: null, total: { $sum: "$stockOutQuantity" } } },
      ]);
      const stockInDay = inSum[0]?.total || 0;
      const stockOutDay = outSum[0]?.total || 0;
      rows.push({
        spareName: p.name,
        category: p.category,
        storedQuantity: p.quantity,
        stockInQuantity: stockInDay,
        stockOutQuantity: stockOutDay,
        remainingQuantity: p.quantity,
      });
    }
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const dailyStockOut = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date query (YYYY-MM-DD) is required" });
    }
    const range = dayRange(date);
    if (!range) {
      return res.status(400).json({ message: "Invalid date" });
    }
    const list = await StockOut.find({
      stockOutDate: { $gte: range.start, $lt: range.end },
    })
      .populate("sparePart", "name category")
      .sort({ stockOutDate: 1 });
    return res.json(
      list.map((r) => ({
        id: r._id,
        spareName: r.sparePart?.name || "",
        category: r.sparePart?.category || "",
        stockOutQuantity: r.stockOutQuantity,
        stockOutUnitPrice: r.stockOutUnitPrice,
        stockOutTotalPrice: r.stockOutTotalPrice,
        stockOutDate: r.stockOutDate,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { dailyStockStatus, dailyStockOut };
