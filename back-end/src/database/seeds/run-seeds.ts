import { DataSource } from 'typeorm';
import databaseConfig from '../../config/database.config';
import { Category } from '../../entities/category.entity';
import { defaultCategories } from './default-categories.seed';
import { seedSampleData } from './sample-data.seed';

async function runSeeds() {
  const dataSource = new DataSource(databaseConfig() as any);

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const categoryRepository = dataSource.getRepository(Category);

    // Check if default categories already exist
    const existingCategories = await categoryRepository.count({ where: { isDefault: true } });

    if (existingCategories === 0) {
      console.log('Seeding default categories...');

      for (const categoryData of defaultCategories) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
      }

      console.log(`✅ Seeded ${defaultCategories.length} default categories`);
    } else {
      console.log('Default categories already exist, skipping...');
    }

    // Seed sample data
    await seedSampleData(dataSource);
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

if (require.main === module) {
  runSeeds()
    .then(() => {
      console.log('✅ All seeds completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed process failed:', error);
      process.exit(1);
    });
}

export { runSeeds };
