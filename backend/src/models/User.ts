import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// User attributes interface
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  user_type: 'coach' | 'student';
  created_at: Date;
}

// Attributes for user creation
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone_number!: string;
  public user_type!: 'coach' | 'student';
  public created_at!: Date;
}

// Initialize User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    user_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['coach', 'student']],
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  }
);

export default User;
