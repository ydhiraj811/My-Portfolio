import { Portfolio } from "../models/Portfolio.js";
export async function getPortfolio(_req, res) {
    const doc = await Portfolio.findOne({}).lean();
    return res.json(doc);
}
export async function updatePortfolio(req, res) {
    const { _id, __v, createdAt, updatedAt, ...payload } = req.body;
    const current = await Portfolio.findOne({});
    if (!current) {
        const created = await Portfolio.create(payload);
        return res.status(201).json(created);
    }
    current.set(payload);
    await current.save();
    return res.json(current);
}
