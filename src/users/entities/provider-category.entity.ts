import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Provider } from './provider.entity';
import { Category } from '../../metadata/entities/category.entity';

@Entity({ name: 'n_provider_category' })
export class ProviderCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Provider, provider => provider.providerCategories)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}