import prisma from '../config/db.js';

export async function listCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        authority: {
          select: {
            id: true,
            department: true,
            designation: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    return res.status(200).json({
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        section: c.section,
        sla_hours: c.sla_hours,
        sub_authority_id: c.authority_id,
        sub_authority_name: c.authority?.department || 'Administration'
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description = '', section = 'college', sla_hours = 48, authority_id } = req.body;

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        section,
        sla_hours: parseInt(sla_hours, 10),
        authority_id: authority_id || null
      }
    });

    return res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
}
