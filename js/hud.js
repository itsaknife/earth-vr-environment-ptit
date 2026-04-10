import * as THREE from 'three';
import { formatVietnamTime, nowInLunarMonth, nowInYear } from './time.js';

// ── Earth HUD ────────────────────────────────────────────────────────────────
export var EarthHUD = function (camera) {
  var width = 1024,
    height = 256;
  this.maxTransparency = 0.9;
  this.minTransparency = 0;
  this.transparency = this.maxTransparency;
  this.visibility = true;
  this._camera = camera;
  var canvas = (this.canvas = document.createElement("canvas"));
  var context = (this.context = this.canvas.getContext("2d"));
  var texture = (this.texture = new THREE.Texture(canvas));
  var material = (this.material = new THREE.MeshBasicMaterial({
    map: texture,
  }));
  material.transparent = true;
  canvas.width = width;
  canvas.height = height;
  var geometry = (this.geometry = new THREE.PlaneGeometry(20, 5));
  var plane = (this.plane = new THREE.Mesh(geometry, material));
  plane.position.set(0, 8, 0);

  this.update = function () {
    if (this.visibility && this.transparency < this.maxTransparency) {
      this.transparency += 0.02;
    } else if (!this.visibility && this.transparency > this.minTransparency) {
      this.transparency -= 0.02;
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "rgba(255, 255, 255," + this.transparency + ")";
    this.context.font = "100px sans-serif";
    this.context.textAlign = "left";
    this.context.textBaseline = "hanging";
    this.context.font = "30px sans-serif";
    this.context.fillText("Vietnam (UTC+7):", 0, 0);
    this.context.font = "40px Courier New";
    this.context.fillText(formatVietnamTime(), 0, 80);

    this.texture.needsUpdate = true;
    const worldPos = new THREE.Vector3();
    this._camera.getWorldPosition(worldPos);
    var angle = Math.atan2(worldPos.x, worldPos.z);
    this.plane.quaternion.set(0, 0, 0, 1);
    this.plane.rotateY(angle);
  };
  this.show = function () {
    this.visibility = true;
  };
  this.hide = function () {
    this.visibility = false;
  };
};

// ── Moon HUD ─────────────────────────────────────────────────────────────────
export var MoonHUD = function (camera) {
  var width = 1024,
    height = 256;
  this.maxTransparency = 0.9;
  this.minTransparency = 0;
  this.transparency = this.maxTransparency;
  this.visibility = true;
  this._camera = camera;
  var canvas = (this.canvas = document.createElement("canvas"));
  var context = (this.context = this.canvas.getContext("2d"));
  var texture = (this.texture = new THREE.Texture(canvas));
  var material = (this.material = new THREE.MeshBasicMaterial({
    map: texture,
  }));
  material.transparent = true;
  canvas.width = width;
  canvas.height = height;
  var geometry = (this.geometry = new THREE.PlaneGeometry(200, 50));
  var plane = (this.plane = new THREE.Mesh(geometry, material));
  plane.position.set(0, 8, 0);

  this.update = function () {
    if (this.visibility && this.transparency < this.maxTransparency) {
      this.transparency += 0.02;
    } else if (!this.visibility && this.transparency > this.minTransparency) {
      this.transparency -= 0.02;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255," + this.transparency + ")";
    context.font = "100px sans-serif";
    context.textAlign = "left";
    context.textBaseline = "hanging";
    texture.needsUpdate = true;
    var c = nowInYear() + nowInLunarMonth();
    plane.position.set(
      385 * Math.cos((c - 0.22) * 2 * Math.PI),
      0,
      385 * Math.sin((0.22 - c) * 2 * Math.PI),
    );
    var angle = Math.atan2(this._camera.position.x, this._camera.position.z);
    plane.quaternion.set(0, 0, 0, 1);
    plane.rotateY(angle);
  };
  this.getPhase = function () {
    var c = nowInLunarMonth();
    var padding = 0.02;
    if (c < 0.0 + padding || c > 1.0 - padding) return "Trăng mới";
    if (c >= 0.0 + padding && c <= 0.25 - padding)
      return "Trăng lưỡi liềm đầu tháng";
    if (c > 0.25 - padding && c < 0.25 + padding)
      return "Trăng bán nguyệt đầu tháng";
    if (c >= 0.25 + padding && c <= 0.5 - padding)
      return "Trăng khuyết đầu tháng";
    if (c > 0.5 - padding && c < 0.5 + padding) return "Trăng tròn";
    if (c >= 0.5 + padding && c <= 0.75 - padding)
      return "Trăng khuyết cuối tháng";
    if (c > 0.75 - padding && c < 0.75 + padding)
      return "Trăng bán nguyệt cuối tháng";
    else return "Trăng lưỡi liềm cuối tháng";
  };
  this.show = function () {
    this.visibility = true;
  };
  this.hide = function () {
    this.visibility = false;
  };
};
