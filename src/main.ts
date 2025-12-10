import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Admin System API')
    .setDescription('西湖区后台管理系统的 API 文档')
    .setVersion('1.0')
    .addTag('Auth', '用户认证相关接口')
    .addTag('Products', '商品管理接口')
    .addBearerAuth(
      // 支持 JWT Bearer Token
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入 JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // 访问路径：/api-docs
  const configService = app.get(ConfigService);
  const port: number = configService.get('PORT', 3000);
  await app.listen(port);
}
bootstrap();
