import { optimizeFrameWeight } from "@/utils/optimization";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { variables } = req.body;
    try {
      const result = await optimizeFrameWeight(variables);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}