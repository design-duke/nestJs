import { Injectable } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './entities/cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private catRepository: Repository<Cat>,
  ) {}
  create(createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  async findAll(): Promise<Cat[]> {
    return await this.catRepository.find();
  }

  async findOne(id: number): Promise<Cat | null> {
    return await this.catRepository.findOneBy({ id });
  }

  update(id: number, updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  remove(id: number) {
    return `This action removes a #${id} cat`;
  }
}
