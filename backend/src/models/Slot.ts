import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

// Slot attributes interface
interface SlotAttributes {
  id: number;
  coach_id: number;
  start_time: Date;
  end_time: Date;
  is_booked: boolean;
  student_id?: number | null;
  satisfaction_score?: number | null;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

// Attributes for slot creation
interface SlotCreationAttributes extends Optional<SlotAttributes, 'id' | 'is_booked' | 'student_id' | 'satisfaction_score' | 'notes' | 'created_at' | 'updated_at'> {}

// Slot model class
class Slot extends Model<SlotAttributes, SlotCreationAttributes> implements SlotAttributes {
  public id!: number;
  public coach_id!: number;
  public start_time!: Date;
  public end_time!: Date;
  public is_booked!: boolean;
  public student_id?: number | null;
  public satisfaction_score?: number | null;
  public notes?: string | null;
  public created_at!: Date;
  public updated_at!: Date;
}

// Initialize Slot model
Slot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    coach_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_booked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    satisfaction_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Slot',
    tableName: 'slots',
    timestamps: false,
    hooks: {
      beforeUpdate: (slot) => {
        slot.updated_at = new Date();
      },
    },
  }
);

// Define associations between models
Slot.belongsTo(User, { foreignKey: 'coach_id', as: 'coach' });
Slot.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
User.hasMany(Slot, { foreignKey: 'coach_id', as: 'coachSlots' });
User.hasMany(Slot, { foreignKey: 'student_id', as: 'studentSlots' });

export default Slot;
