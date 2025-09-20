import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  externalUserId: string;

  @Prop({ required: true })
  externalOrderId: string;

  @Prop({ required: true })
  providerCode: string;

  @Prop({ required: true })
  currencyFrom: string;

  @Prop({ required: true })
  currencyTo: string;

  @Prop({ required: true })
  amountFrom: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  state?: string;

  @Prop()
  ip?: string;

  @Prop({ required: true })
  walletAddress: string;

  @Prop()
  walletExtraId?: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  metadata?: any;

  @Prop()
  redirectUrl?: string;

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop()
  errorType?: string;

  @Prop()
  errorMessage?: string;

  @Prop({ type: [Object] })
  errorDetails?: any[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction); 